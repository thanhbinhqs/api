import { BaseEntity } from "src/common/entities/base-entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Jig } from "./jig.entity";

@Entity('jig_drawings')
export class JigDrawing extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    fileName: string;

    @Column()
    filePath: string;

    @Column()
    fileSize: number;

    @Column()
    mimeType: string;

    // Phiên bản bản vẽ
    @Column({ default: '1.0' })
    drawingVersion: string;

    // Loại bản vẽ: assembly, detail, schematic, etc.
    @Column({ default: 'assembly' })
    drawingType: string;

    // Định dạng file: pdf, dwg, step, etc.
    @Column()
    fileFormat: string;

    // Ngày phê duyệt
    @Column({ type: 'timestamp with time zone', nullable: true })
    approvedAt?: Date;

    // Người phê duyệt
    @Column({ nullable: true })
    approvedBy?: string;

    // Trạng thái: draft, approved, obsolete
    @Column({ default: 'draft' })
    status: string;

    // Ghi chú
    @Column({ type: 'text', nullable: true })
    notes?: string;

    // Số bản vẽ (drawing number)
    @Column({ nullable: true })
    drawingNumber?: string;

    // Revision
    @Column({ default: 'A' })
    revision: string;

    // URL để xem trước (thumbnail)
    @Column({ nullable: true })
    thumbnailPath?: string;

    // Quan hệ với Jig
    @ManyToOne(() => Jig, jig => jig.drawings)
    @JoinColumn({ name: 'jig_id' })
    jig: Jig;
}
