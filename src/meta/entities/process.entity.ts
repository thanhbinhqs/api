import { BaseEntity } from "src/common/entities/base-entity";
import { Jig } from "src/jig/entities/jig.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('processes')
export class Process extends BaseEntity {

    @Column()
    name: string;

    @Column()
    slug: string;

    @Column({nullable: true})
    description?: string;

    @Column()
    code: string;


    // One process can have many jigs
    @OneToMany(() => Jig, jig => jig.process)
    jigs?: Jig[];
}