/**
 * Typed Redux Hooks
 *
 * Pre-typed hooks for use throughout all MFEs.
 * Use these instead of plain `useDispatch` and `useSelector`
 * to get proper TypeScript type inference.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
