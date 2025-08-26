import { BaseEntity } from 'src/common/entities/base-entity';
import { InOutHistory } from 'src/meta/entities/inout-history.entity';
import { Project } from 'src/meta/entities/project.entity';
import { Location } from 'src/meta/entities/location.entity';
import { Vendor } from 'src/meta/entities/vendor.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PartDetail } from './part-detail.entity';
import { Jig } from 'src/jig/entities/jig.entity';

@Entity('parts')
export class Part extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: 0 })
  price: number = 0;

  @Column({ default: 'VND' })
  priceCurrency: string = 'VND';

  @Column({ default: 'material' })
  orderType: string | 'mro' | 'material' | 'self-made' = 'material';

  @Column({ nullable: true, default: 'pcs' })
  unit?: string = 'pcs';

  @Column({ default: false })
  isDetailed: boolean = false;

  @Column({ default: 0 })
  safeStock: number = 0;

  // Tính toán số lượng tồn kho từ InOutHistory
  @Column({ default: 0, comment: 'Calculated field: current stock quantity' })
  currentStock: number = 0;

  @Column({ default: 0, comment: 'Calculated field: available stock quantity' })
  availableStock: number = 0;

  @Column({ default: 0, comment: 'Calculated field: reserved stock quantity' })
  reservedStock: number = 0;

  // Vendor information
  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: Vendor;

  // Default location
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: Location;

  //relationship to project entity
  @ManyToOne(() => Project, (project) => project.parts, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  //relationship to inout history entity
  @OneToMany(() => InOutHistory, (inOutHistory) => inOutHistory.part)
  inOutHistories: InOutHistory[];

  @OneToMany(() => PartDetail, (partDetail) => partDetail.part)
  details: PartDetail[];

  //relationship to jig entity
  @ManyToOne(() => Jig, (jig) => jig.parts, { nullable: true })
  @JoinColumn({ name: 'jig_id' })
  jig?: Jig;
}
