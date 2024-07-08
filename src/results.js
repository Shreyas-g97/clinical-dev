import { create } from 'zustand';

const useResultsStore = create((set) => ({
    results: null,
    setResults: (results) => set(() => ({ results: results })),
}));

const useLoadingStore = create((set) => ({
    loading: false,
    setLoading: (loading) => set(() => ({ loading: loading })),
}));

const useQueryStore = create((set) => ({
    query: '',
    setQuery: (query) => set(() => ({ query: query })),
}));

const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set(() => ({ user: user })),
}));

const useUploadStore = create((set) => ({
    upload: null,
    setUpload: (upload) => set(() => ({ upload: upload })),
}));

export default { useResultsStore, useLoadingStore, useQueryStore, useUserStore, useUploadStore };