import { BaseEntity } from 'src/common/entities/base-entity';
import { Jig } from 'src/jig/entities/jig.entity';
import { Part } from 'src/part/entities/part.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  friendlyName: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  code?: string;

  //relationship to part entity
  @OneToMany(() => Part, (part) => part.project)
  parts: Part[];

  @OneToMany(() => Jig, (jig) => jig.project)
  jigs?: Jig[];
}
