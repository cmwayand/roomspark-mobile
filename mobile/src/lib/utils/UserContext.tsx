import { createContext, useContext, useState, ReactNode } from 'react';

const USER_TYPES = {
  FREE: 'free',
  PAID: 'paid',
  PREMIUM: 'premium',
} as const;

export type UserTypes = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const PROJECT_LIMITS: Record<UserTypes, number> = {
  free: 3,
  paid: 10,
  premium: Infinity,
};

type UserContextType = {
  userType: UserTypes;
  setUserType: (type: UserTypes) => void;
  isOverLimit: boolean;
  setIsOverLimit: (type: boolean) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserTypes>('free');
  const [isOverLimit, setIsOverLimit] = useState(false);

  return (
    <UserContext.Provider value={{ userType, setUserType, isOverLimit, setIsOverLimit }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
