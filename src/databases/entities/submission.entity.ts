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

  // foreign key to User entity
  @Column({ name: 'learner_id' })
  learnerId: string;

  // foreign key to Simulation entity
  @Column({ name: 'simulation_id' })
  simulationId: string;

  @Column({ name: 'latest_score_job_id', nullable: true })
  latestScoreJobId: string;

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
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
