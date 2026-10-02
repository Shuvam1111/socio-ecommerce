'use client';

import { useEffect } from 'react';

import { initializeMockData } from '@/lib/mock-data';

export function MockDataProvider() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return null;
}
