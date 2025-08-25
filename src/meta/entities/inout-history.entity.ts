import { Transform } from "class-transformer";
import { BaseEntity } from "src/common/entities/base-entity";
import { JigDetail } from "src/jig/entities/jig-detail.entity";
import { PartDetail } from "src/part/entities/part-detail.entity";
import { Part } from "src/part/entities/part.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity('inout-histories')
export class InOutHistory extends BaseEntity {

    
    @Column()
    quantity: number;

    @Column({
        transformer: {
            to: (value: InOutType) => value,
            from: (value) => value,
        },
    })
    type: InOutType;

    @Column({nullable: true})
    description?: string;

    //relationship to part entity
    @ManyToOne(() => Part, (part) => part.inOutHistories)
    @JoinColumn({ name: 'part_id' })
    part: Part;

    //relationship to part detail entity  
    @ManyToOne(() => PartDetail, (partDetail) => partDetail.inOutHistories, { nullable: true })
    @JoinColumn({ name: 'part_detail_id' })
    partDetail?: PartDetail;

    //relationship to jig detail entity
    @ManyToOne(() => JigDetail, (jigDetail) => jigDetail.inOutHistories, { nullable: true })
    @JoinColumn({ name: 'jig_detail_id' })
    jigDetail?: JigDetail;

}

export enum InOutType {
    NEW = 'new',
    IN = 'in',
    REPAIRED = 'repaired',
    OUT = 'out',
    SCRAP = 'scrap',
}