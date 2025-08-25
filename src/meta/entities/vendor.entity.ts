import { BaseEntity } from "src/common/entities/base-entity"
import { JigDetail } from "src/jig/entities/jig-detail.entity";
import { Jig } from "src/jig/entities/jig.entity";
import { Column, Entity, OneToMany } from "typeorm"

@Entity('vendors')
export class Vendor extends BaseEntity {
    @Column()
    name: string;

    @Column()
    code: string;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => Jig, jig => jig.vendor)
    jigs: Jig[];

    @OneToMany(() => JigDetail, jigDetail => jigDetail.vendor)
    jigDetails: JigDetail[];
}