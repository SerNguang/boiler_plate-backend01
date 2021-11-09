import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import Address from './address.entity';

import { UserRole } from './user.interface';
import Post from 'src/posts/post.entity';
import PublicFile from 'src/files/publicFile.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({ nullable: true })
  public fullName: string;

  @Column({ nullable: true })
  public businessName: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  @Exclude()
  public password: string;

  @Column({ nullable: true })
  ceaReg?: string;
  
  @Column({ nullable: true })
  agencyReg?: string;

  @Column({ nullable: true })
  designation?: string;

  @Column({ nullable: true })
  aboutMe?: string;

  @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
  role?: UserRole;

  
  @OneToOne(() => Address, {
    eager: true,
    cascade: true
  })
  @JoinColumn()
  public address?: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts?: Post[];

  @JoinColumn()
  @OneToOne(
    () => PublicFile,
    {
      eager: true,
      nullable: true
    }
  )
  public avatar?: PublicFile;

  @Column({nullable: true})
  profileImage?: string;

  @Column({
    nullable: true
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column()
  public stripeCustomerId?: string;

  @Column({ nullable: true })
  public monthlySubscriptionStatus?: string;

  @Column({ default: true })
  public isEmailConfirmed: boolean;

  @Column({ default: false })
  public isAdmin: boolean;

}

export default User;