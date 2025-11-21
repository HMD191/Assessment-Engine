import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

export enum ScoreJobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

@Entity('score_job')
export class ScoreJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;
  @Column({ name: 'submission_id' })
  submissionId: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, any>;

  // foreign key to User entity
  @Column({ name: 'learner_id' })
  learnerId: string;

  // foreign key to Simulation entity
  @Column({ name: 'simulation_id' })
  simulationId: string;

  @Column({
    type: 'enum',
    enum: ScoreJobStatus,
    default: ScoreJobStatus.QUEUED,
  })
  status: ScoreJobStatus;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

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
