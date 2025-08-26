import { BaseEntity } from 'src/common/entities/base-entity';
import { JigDetail } from 'src/jig/entities/jig-detail.entity';
import { PartDetail } from 'src/part/entities/part-detail.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('locations')
export class Location extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description?: string;

  //relationships to jig details
  @OneToMany(() => JigDetail, (jigDetail) => jigDetail.location)
  jigDetails: JigDetail[];

  //relationships to part details
  @OneToMany(() => PartDetail, (partDetail) => partDetail.location)
  partDetails: PartDetail[];
}
