"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProposals } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import {