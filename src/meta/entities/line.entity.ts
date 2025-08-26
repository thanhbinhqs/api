import { BaseEntity } from 'src/common/entities/base-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Zone } from './zone.entity';
import { JigDetail } from 'src/jig/entities/jig-detail.entity';

@Entity('lines')
export class Line extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  code: string;

  // relationship with zones
  @ManyToOne(() => Zone, (zone) => zone.lines, { nullable: true })
  zone?: Zone;

  @OneToMany(() => JigDetail, (jigDetail) => jigDetail.line)
  jigDetails: JigDetail[];
}
