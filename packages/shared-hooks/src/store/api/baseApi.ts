/**
 * Base API - RTK Query setup
 *
 * Provides a shared RTK Query API instance that all MFEs can extend
 * using `injectEndpoints`. Each MFE can define its own endpoints
 * while sharing a single cache and base configuration.
 *
 * Usage in MFEs:
 *   import { baseApi } from '@mfe-demo/shared-hooks';
 *
 *   const myMfeApi = baseApi.injectEndpoints({
 *     endpoints: (builder) => ({
 *       getItems: builder.query({ query: () => '/items' }),
 *     }),
 *   });
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiConfig } from '../apiConfig';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiConfig().baseUrl,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
