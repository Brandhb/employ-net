export interface User {
  id: string; // UUID
  clerkUserId: string; // Clerk's unique ID for the user
  emplyClerkUserId: string; // Clerk's unique ID for the user
  name?: string; // Optional name of the user
  email?: string; // Optional unique email
  createdAt: Date; // Timestamp when the user was created
  updatedAt: Date; // Timestamp when the user was last updated
  veriffStatus?: string; // Optional verification status
  verificationStep: number; // Current verification step
  phoneNumber?: string; // Optional phone number
  points_balance?: number; // Optional points balance
  full_name?: string; // Optional full name of the user
  verification_status?: string; // Optional verification status
  activities: Activity[]; // Related activities
  activityLogs: ActivityLog[]; // Related activity logs
  adInteractions: AdInteraction[]; // Related ad interactions
  documents: Document[]; // Related documents
  employ_payout_requests: PayoutRequest[]; // Related payout requests
  employ_rewards: Reward[]; // Related rewards
  notifications: Notification[]; // Related notifications
  processedPayouts: Payout[]; // Payouts processed by this user
  payouts: Payout[]; // Related payouts
  verificationSessions: VerificationSession[]; // Related verification sessions
}

export interface Document {
  id: string; // UUID
  userId: string; // User UUID
  documentType: string; // Type of the document
  documentUrl: string; // URL of the document
  encrypted: boolean; // Whether the document is encrypted
  createdAt: Date; // Timestamp when the document was created
  publicId: string; // Public identifier
  temp_id?: string; // Temporary UUID
  user: User; // Related user
}

export interface VerificationSession {
  id: string; // UUID
  userId: string; // User UUID
  sessionId: string; // Session ID
  status: string; // Status of the verification session
  reason?: string; // Optional reason for the session
  createdAt: Date; // Timestamp when the session was created
  updatedAt: Date; // Timestamp when the session was last updated
  temp_user_id?: string; // Temporary user UUID
  user: User; // Related user
}


export interface ActivityData {
  _count: number;
  id: string;
  title: string;
  type: "video" | "survey";
  status: "active" | "draft";
  points: number;
  createdAt: string;
  completedAt?: Date | null;
  metadata?: Record<string, any>;
  userId?: string; // Add userId if necessary
  is_template?: boolean;
};


export interface Activity {
  id: string; // UUID
  userId: string; // User UUID
  type: string; // Type of activity
  title: string; // Title of the activity
  description?: string; // Optional description
  points: number; // Points associated with the activity
  status: string; // Status of the activity
  completedAt?: Date; // Completion timestamp
  createdAt?: Date; // Creation timestamp
  metadata?: Record<string, any>; // Metadata as a key-value store
  user: User; // Related user
  is_template: boolean;
  logs: ActivityLog[]; // Related activity logs
}

export interface ActivityLog {
  id: string; // UUID
  userId: string; // User UUID
  activityId?: string | null; // Matches Prisma schema (nullable or undefined)
  action: string; // Action performed
  metadata?: Record<string, any>; // Metadata as a key-value store
  createdAt?: Date | null; // Matches Prisma schema (nullable or undefined)
  activity?: Activity | null; // Related activity can be null
  user?: User; // Related user
}

export interface Payout {
  id: string; // UUID
  userId: string; // User UUID
  amount: number; // Payout amount
  status?: string; // Status of the payout
  processedBy?: string; // User UUID of the processor
  processedAt?: Date; // Processing timestamp
  createdAt?: Date; // Creation timestamp
  processor?: User; // Related processor user
  user: User; // Related user
}

export interface AdInteraction {
  id: string; // UUID
  userId: string; // User UUID
  adId: string; // Ad ID
  interactionType: string; // Type of interaction
  duration?: number; // Duration of interaction
  createdAt?: Date; // Creation timestamp
  user: User; // Related user
}

export interface Notification {
  id: string; // UUID
  userId: string; // User UUID
  title: string; // Notification title
  message: string; // Notification message
  type: string; // Notification type
  read?: boolean; // Whether the notification is read
  createdAt?: Date; // Creation timestamp
  user: User; // Related user
}

export interface Reward {
  id: string; // UUID
  user_id: string; // User UUID
  points: number; // Reward points
  description?: string; // Reward description
  createdAt?: Date; // Creation timestamp
  users: User; // Related user
}

export interface PayoutRequest {
  id: string; // UUID
  user_id: string; // User UUID
  amount: number; // Payout request amount
  status?: string; // Status of the payout request
  createdAt?: Date; // Creation timestamp
  users: User; // Related user
}

export {};

export type Roles = 'admin' | 'moderator'

/*declare global {
  interface ClerkAuthorization {
    permission: "";
    role: "org:admin" | "org:member";
  }
}
*/
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role? : Roles
    }
   
  }
}