import { BaseEntity } from "src/common/entities/base-entity"
import { Column, Entity, ManyToOne, OneToMany } from "typeorm"
import { Jig } from "./jig.entity"
import { Vendor } from "src/meta/entities/vendor.entity";
import { Line } from "src/meta/entities/line.entity";
import { Location } from "src/meta/entities/location.entity";
import { PartDetail } from "src/part/entities/part-detail.entity";
import { InOutHistory } from "src/meta/entities/inout-history.entity";

export enum JigStatus {
    NEW = "new",
    STORAGE = "storage",
    LINE = "line",
    REPAIR = "repair",
    SCRAP = "scrap",
    VENDOR = "vendor"
}

@Entity('jig-details')
export class JigDetail extends BaseEntity {

    // relationship to jig
    @ManyToOne(() => Jig, (jig) => jig.details, { nullable: false })
    jig: Jig;


    //automatic code generation by system
    @Column()
    code: string;

    //code is interfaced from external system
    @Column({ nullable: true})
    mesCode?: string;

    @Column({ nullable: true })
    description?: string;


    @Column({
        default: JigStatus.NEW,
        transformer: {
            to: (value: JigStatus) => value,
            from: (value: string) => value as JigStatus
        }
    })
    status: JigStatus = JigStatus.NEW;

    //location can be a line, location, vendor with relationship
    @ManyToOne(() => Location, location => location.jigDetails, { nullable: true })
    location?: Location;

    @ManyToOne(() => Line, line => line.jigDetails, { nullable: true })
    line?: Line;

    @ManyToOne(() => Vendor, vendor => vendor.jigDetails, { nullable: true })
    vendor?: Vendor;

    // Lưu vị trí mặc định để có thể khôi phục khi cần
    @ManyToOne(() => Location, { nullable: true })
    defaultLocation?: Location;

    @ManyToOne(() => Line, { nullable: true })
    defaultLine?: Line;

    @ManyToOne(() => Vendor, { nullable: true })
    defaultVendor?: Vendor;

    //relationship to part details
    @OneToMany(() => PartDetail, partDetail => partDetail.jigDetail)
    partDetails: PartDetail[];

    //latest maintenance date
    @Column({ nullable: true })
    lastMaintenanceDate?: Date;

    //inout history relationship
    @OneToMany(() => InOutHistory, inOutHistory => inOutHistory.jigDetail)
    inOutHistories: InOutHistory[];

    @Column({ nullable: true })
    mechanicalVersion?: string;
}