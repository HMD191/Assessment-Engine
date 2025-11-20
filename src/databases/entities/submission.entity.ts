import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubmissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
}

@Entity('submission')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //should refer to User entity
  @Column({ name: 'user_id' })
  userId: number;

  //should refer to Simulation entity
  @Column({ name: 'simulation_id' })
  simulationId: number;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.IN_PROGRESS,
  })
  status: SubmissionStatus;

  @Column({ type: 'jsonb', nullable: true, default: null })
  data: any;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
