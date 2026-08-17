import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Profile {
  _id: number;
  name: string;
  title: string;
  company: string;
  painPoint: string;
  location?: string;
  icpSegment?: string;
  createdAt?: string;
}

export interface DM {
  _id: number;
  profileId: number;
  dmText: string;
  status: string;
  sentDate?: string;
  createdAt?: string;
}

export const getProfiles = async (): Promise<Profile[]> => {
  const response = await client.get<Profile[]>('/profiles');
  return response.data;
};

export const addProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const response = await client.post<Profile>('/profiles', profile);
  return response.data;
};

export const generateDM = async (profile: Profile): Promise<DM> => {
  const response = await client.post<DM>('/dms/generate', {
    profileId: profile._id,
    name: profile.name,
    title: profile.title,
    company: profile.company,
    painPoint: profile.painPoint,
  });
  return response.data;
};

export const getDMs = async (): Promise<DM[]> => {
  const response = await client.get<DM[]>('/dms');
  return response.data;
};

export const sendDM = async (dmId: number): Promise<DM> => {
  const response = await client.post<DM>(`/dms/${dmId}/send`, {});
  return response.data;
};

export default client;
