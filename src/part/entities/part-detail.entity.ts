import { BaseEntity } from 'src/common/entities/base-entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Part } from './part.entity';
import { InOutHistory } from 'src/meta/entities/inout-history.entity';
import { Location } from 'src/meta/entities/location.entity';
import { JigDetail } from 'src/jig/entities/jig-detail.entity';

export enum PartDetailStatus {
  AVAILABLE = 'available',
  IN_USE = 'in-use',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  SCRAP = 'scrap',
}

@Entity('part-details')
export class PartDetail extends BaseEntity {
  //relationship to part entity
  @ManyToOne(() => Part, (part) => part.details)
  @JoinColumn({ name: 'part_id' })
  part: Part;

  //serial number
  @Column({ unique: true })
  serialNumber: string;

  //location relationship
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: Location;

  //status
  @Column({
    default: PartDetailStatus.AVAILABLE,
    transformer: {
      to: (value: PartDetailStatus) => value,
      from: (value) => value,
    },
  })
  status: PartDetailStatus = PartDetailStatus.AVAILABLE;

  // Tracking fields
  @Column({ nullable: true })
  purchaseDate?: Date;

  @Column({ nullable: true })
  warrantyExpiration?: Date;

  @Column({ nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ nullable: true })
  notes?: string;

  //relationship to inout history entity
  @OneToMany(() => InOutHistory, (inOutHistory) => inOutHistory.partDetail)
  inOutHistories: InOutHistory[];

  // relationship to jig detail
  @ManyToOne(() => JigDetail, (jigDetail) => jigDetail.partDetails, {
    nullable: true,
  })
  @JoinColumn({ name: 'jig_detail_id' })
  jigDetail?: JigDetail;

  // Lưu vị trí mặc định để có thể khôi phục khi cần
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'default_location_id' })
  defaultLocation?: Location;

  @ManyToOne(() => JigDetail, { nullable: true })
  @JoinColumn({ name: 'default_jig_detail_id' })
  defaultJigDetail?: JigDetail;
}
