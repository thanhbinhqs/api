import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { DEFAULT_SYSTEM_SETTINGS } from '../common/constants/system-settings.constants';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async seedDefaultSettings(): Promise<void> {
    for (const [key, value] of Object.entries(DEFAULT_SYSTEM_SETTINGS)) {
      const existing = await this.settingsRepository.findOne({
        where: { key },
      });
      if (!existing) {
        await this.settingsRepository.save({
          key,
          value,
          version: '1.0.0',
        });
      }
    }
  }

  async getSetting(key: string): Promise<any> {
    // Check cache first
    const cachedValue = await this.cacheManager.get(`setting:${key}`);
    if (cachedValue) {
      return cachedValue;
    }

    // Get from database if not in cache
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (setting) {
      // Cache the value with TTL 1 hour
      await this.cacheManager.set(`setting:${key}`, setting.value, 3600 * 1000);
    }
    return setting?.value;
  }

  async getAllSettings(
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; order: 'ASC' | 'DESC' },
    filter?: Partial<SystemSetting>,
  ): Promise<{ data: SystemSetting[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = this.settingsRepository.createQueryBuilder('setting');

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          query.andWhere(`setting.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (sort) {
      query.orderBy(`setting.${sort.field}`, sort.order);
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }

  async updateSetting(key: string, value: any): Promise<SystemSetting> {
    // Update database
    const updated = await this.settingsRepository.save({ key, value });

    // Update cache
    await this.cacheManager.set(`setting:${key}`, value, 3600 * 1000);

    return updated;
  }

  async clearCache(key: string): Promise<void> {
    await this.cacheManager.del(`setting:${key}`);
  }

  async updateMultipleSettings(
    settings: UpdateSystemSettingDto[],
  ): Promise<SystemSetting[]> {
    const updated = await this.settingsRepository.save(settings as any);

    //update cache for each setting that was updated
    for (const setting of updated) {
      await this.cacheManager.set(
        `setting:${setting.key}`,
        setting.value,
        3600 * 1000,
      );
    }

    return updated;
  }
}
