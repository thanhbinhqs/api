import { BaseEntity } from "src/common/entities/base-entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Line } from "./line.entity";
import { Jig } from "src/jig/entities/jig.entity";

@Entity('zones')
export class Zone extends BaseEntity{

    @Column()
    name: string;

    @Column()
    slug: string;


    @Column({nullable: true})
    description?: string;

    @Column({nullable: true})
    code?: string;

    //parent zone relationship
    @ManyToOne(() => Zone, (zone) => zone.children, { nullable: true })
    parentZone?: Zone;

    @OneToMany(() => Zone, (zone) => zone.parentZone)
    children?: Zone[];

    //relationship with lines
    @OneToMany(() => Line, (line) => line.zone)
    lines?: Line[];

    //relationship with jigs
    @OneToMany(() => Jig, (jig) => jig.zone)
    jigs?: Jig[];
}