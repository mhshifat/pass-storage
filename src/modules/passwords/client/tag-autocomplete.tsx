"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Check, CheckIcon, Tag as TagIcon, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { trpc } from "@/trpc/client"
import { cn } from "@/lib/utils"

interface TagAutocompleteProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  passwordId?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagAutocomplete({
  selectedTagIds,
  onTagsChange,
  passwordId,
  placeholder,
  className,
  disabled = false,
}: TagAutocompleteProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Fetch all tags when popover is open
  const { data: allTagsData, isLoading: isLoadingTags } = trpc.passwords.getExportFilters.useQuery(
    undefined,
    { 
      enabled: open,
      refetchOnMount: true,
      staleTime: 0, // Always fetch fresh data when popover opens
    }
  )

  // Fetch autocomplete suggestions when there's a query
  const { data: autocompleteTags } = trpc.passwords.tagAutocomplete.useQuery(
    { query, limit: 10 },
    { enabled: open && query.length > 0 }
  )

  // Fetch tag suggestions based on password context
  const { data: suggestedTags } = trpc.passwords.tagSuggestions.useQuery(
    { passwordId, limit: 5 },
    { enabled: open && !query && passwordId !== undefined }
  )

  const selectedTags = React.useMemo(() => {
    if (!allTagsData?.tags) return []
    return allTagsData.tags.filter((tag) => selectedTagIds.includes(tag.id))
  }, [allTagsData, selectedTagIds])

  const handleTagSelect = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId))
      } else {
        onTagsChange([...selectedTagIds, tagId])
      }
      setQuery("")
      // Don't close the popover - allow multiple selections
    },
    [selectedTagIds, onTagsChange]
  )

  const handleTagRemove = useCallback(
    (tagId: string) => {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    },
    [selectedTagIds, onTagsChange]
  )

  // Determine which tags to display
  const displayTags = React.useMemo(() => {
    // If there's a search query
    if (query.length > 0) {
      // Use autocomplete results if available
      if (autocompleteTags && autocompleteTags.length > 0) {
        return autocompleteTags
      }
      // Otherwise filter all tags by query
      if (allTagsData?.tags && allTagsData.tags.length > 0) {
        const lowerQuery = query.toLowerCase()
        return allTagsData.tags.filter((tag) =>
          tag.name.toLowerCase().includes(lowerQuery)
        )
      }
      return []
    }
    
    // No query - show all available tags
    if (allTagsData?.tags && allTagsData.tags.length > 0) {
      return allTagsData.tags
    }
    
    // Fallback to suggestions only if we don't have all tags yet
    if (passwordId && suggestedTags && suggestedTags.length > 0) {
      return suggestedTags
    }
    
    return []
  }, [query, autocompleteTags, suggestedTags, passwordId, allTagsData])

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
            disabled={disabled}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            {placeholder || t("passwords.tags.selectTags")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={t("passwords.tags.searchTags")}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isLoadingTags ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : displayTags.length === 0 && allTagsData !== undefined ? (
                <CommandEmpty>{t("passwords.tags.noTagsFound")}</CommandEmpty>
              ) : displayTags.length > 0 ? (
                <CommandGroup>
                  {(displayTags).map((tag) => {
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => {
                          handleTagSelect(tag.id)
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {selectedTagIds.includes(tag.id) && <CheckIcon className="w-4 h-4" />}
                          {tag.color && (
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                          )}
                          {tag.icon && (
                            <span className="text-xs shrink-0">{tag.icon}</span>
                          )}
                          <span className="flex-1">{tag.name}</span>
                          {(tag as { usageCount?: number }).usageCount !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              ({(tag as { usageCount?: number }).usageCount})
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1.5"
            >
              {tag.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              {tag.icon && <span className="text-xs">{tag.icon}</span>}
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
