export interface AuthUserData {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUserData;
}

export interface DeviceInfoData {
  deviceId: string;
  fingerprint: string;
  deviceName: string;
  licenseId: string | null;
  isActive: boolean;
}

export interface ActivationFormData {
  licenseKey: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
