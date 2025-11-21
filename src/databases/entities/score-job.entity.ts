import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  //should refer to User entity
  @Column({ name: 'submission_id' })
  submissionId: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, any>;

  //should refer to Simulation entity
  @Column({ name: 'learner_id' })
  learnerId: string;

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

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
