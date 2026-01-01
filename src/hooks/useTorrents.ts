import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/qbittorrent'
import type { AddTorrentOptions, TorrentFilterOptions } from '../api/qbittorrent'

export function useTorrents(options: TorrentFilterOptions = {}) {
	return useQuery({
		queryKey: ['torrents', options],
		queryFn: () => api.getTorrents(options),
		refetchInterval: 2000,
	})
}

export function useStopTorrents() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: api.stopTorrents,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useStartTorrents() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: api.startTorrents,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useDeleteTorrents() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ hashes, deleteFiles }: { hashes: string[]; deleteFiles?: boolean }) =>
			api.deleteTorrents(hashes, deleteFiles),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useAddTorrent() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ options, files }: { options: AddTorrentOptions; files?: File[] }) =>
			api.addTorrent(options, files),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useCategories() {
	return useQuery({
		queryKey: ['categories'],
		queryFn: api.getCategories,
	})
}

export function useTags() {
	return useQuery({
		queryKey: ['tags'],
		queryFn: api.getTags,
	})
}

export function useSetCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ hashes, category }: { hashes: string[]; category: string }) =>
			api.setCategory(hashes, category),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useAddTags() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ hashes, tags }: { hashes: string[]; tags: string }) =>
			api.addTags(hashes, tags),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['torrents'] })
			queryClient.invalidateQueries({ queryKey: ['tags'] })
		},
	})
}

export function useRemoveTags() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ hashes, tags }: { hashes: string[]; tags: string }) =>
			api.removeTags(hashes, tags),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['torrents'] })
			queryClient.invalidateQueries({ queryKey: ['tags'] })
		},
	})
}

export function useRenameTorrent() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ hash, name }: { hash: string; name: string }) =>
			api.renameTorrent(hash, name),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['torrents'] }),
	})
}

export function useCreateTag() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (tag: string) => api.createTags(tag),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
	})
}

export function useDeleteTag() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (tag: string) => api.deleteTags(tag),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] })
			queryClient.invalidateQueries({ queryKey: ['torrents'] })
		},
	})
}

export function useCreateCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ name, savePath }: { name: string; savePath?: string }) =>
			api.createCategory(name, savePath),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
	})
}

export function useDeleteCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (name: string) => api.removeCategories([name]),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			queryClient.invalidateQueries({ queryKey: ['torrents'] })
		},
	})
}
