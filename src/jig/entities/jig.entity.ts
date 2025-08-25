import { BaseEntity } from "src/common/entities/base-entity";
import { Process } from "src/meta/entities/process.entity";
import { Project } from "src/meta/entities/project.entity";
import { Zone } from "src/meta/entities/zone.entity";
import { Part } from "src/part/entities/part.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { JigDetail } from "./jig-detail.entity";
import { JigDrawing } from "./jig-drawing.entity";
import { Vendor } from "src/meta/entities/vendor.entity";




@Entity('jigs')
export class Jig extends BaseEntity{

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    //automatic code generation by system
    @Column()
    code: string;

    //code is interfaced from external system
    @Column({ nullable: true})
    mesCode?: string;

    @Column({ nullable: true })
    image?: string;

    //maker
    @ManyToOne(() => Vendor, vendor => vendor.jigs, { nullable: true })
    vendor?: Vendor;

    @ManyToOne(() => Project, project => project.jigs, { nullable: true })
    project?: Project;

    @ManyToOne(() => Process, process => process.jigs, { nullable: true })
    process?: Process;

    @ManyToOne(() => Zone, zone => zone.jigs, { nullable: true })
    zone?: Zone;

    @Column({ default: 0 })
    stdQuantity: number = 0;

    //need maintenance or not
    @Column({ default: false })
    needMaintenance: boolean = false;

    //maintenance interval in days, default is 30 days
    @Column({ default: 30 })
    maintenanceInterval: number = 30;

    //type: hw, sw, mechanical
    @Column({ default: "mechanical" })
    type: string | "mechanical" | "hw" | "sw" = "mechanical";

    //has Part 
    @Column({ default: false })
    hasPart: boolean = false;

    //relationship with parts will be many to many, but for simplicity, we will use one to many
    @OneToMany(() => Part, (part) => part.jig)
    parts?: Part[];

    //relationship to jig details
    @OneToMany(() => JigDetail, (jigDetail) => jigDetail.jig)
    details?: JigDetail[];

    //relationship to jig drawings
    @OneToMany(() => JigDrawing, (jigDrawing) => jigDrawing.jig)
    drawings?: JigDrawing[];

    @Column({ nullable: true })
    mechanicalVersion?: string;


    
}

