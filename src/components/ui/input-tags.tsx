import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Badge } from "./badge";
import { Button } from "./button";
import { CheckIcon, XIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { cn } from "@/lib/utils";

type ListItem = {
  label: string;
  value: string;
  content?: React.ReactNode;
}

type InputTagsProps = {
  type?: "text" | "number";
  loading?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  onSearch: (value: string) => void;
  onFocus?: () => void;
  onDisplayItemRender?: (value: string) => React.ReactNode;
  options?: ListItem[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomTags?: boolean;
  maxTags?: number;
};

const InputTags = React.forwardRef<HTMLDivElement, InputTagsProps>(
  ({ 
    className, 
    value, 
    onChange, 
    onSearch, 
    options = [], 
    placeholder = "Click to search and select options...",
    disabled = false,
    allowCustomTags = true,
    maxTags,
    onFocus,
    loading,
    onDisplayItemRender,
    type,
    ...props 
  }, ref) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const commandInputRef = React.useRef<HTMLInputElement>(null);

    // Focus the command input when popover opens
    React.useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          commandInputRef.current?.focus();
        }, 0);
      }
    }, [isOpen]);

    const addTag = (tag: string) => {
      if (!value.includes(tag) && (!maxTags || value.length < maxTags)) {
        onChange([...value, tag]);
      }
      setSearchValue("");
      setIsOpen(false);
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    };

    const filteredOptions = onSearch !== undefined ? options : options.filter(option => 
      !value.includes(option.value) && 
      option.value.toLowerCase().includes(searchValue.toLowerCase())
    );

    const showCreateOption = allowCustomTags && 
      searchValue.trim() && 
      !options.some(option => option.value.toLowerCase() === searchValue.toLowerCase()) &&
      !value.includes(searchValue.trim());

    const handleInputClick = () => {
      if (!disabled && (!maxTags || value.length < maxTags)) {
        setIsOpen(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && value.length > 0) {
        e.preventDefault();
        removeTag(value[value.length - 1]);
      }
    };

    return (
      <Popover open={isOpen} onOpenChange={!disabled ? setIsOpen : () => {}} key={filteredOptions.length}>
        <PopoverTrigger asChild>
          <div
            ref={ref}
            className={cn(
              "flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              className, {
                "cursor-not-allowed": disabled
              }
            )}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...props}
          >
            {value.map((item) => {
              const itemValue = onDisplayItemRender !== undefined ? onDisplayItemRender(item) : item;
              return (
              <Badge key={item} variant="secondary" className="gap-1" title={typeof itemValue === "string" ? itemValue : ""}>
                {typeof itemValue === "string" ? `${itemValue.slice(0, 15)}${itemValue?.length > 15 ? "..." : ""}` : itemValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeTag(item);
                  }}
                  disabled={disabled}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )
            })}
            {value.length === 0 && (
              <div className="flex items-center gap-1 min-w-[120px]">
                <span className="text-muted-foreground select-none">
                  {placeholder}
                </span>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
            className="w-full p-0 z-50 bg-popover border shadow-md" 
            align="start"
            sideOffset={4}
          >
            <Command>
              <CommandInput
                ref={commandInputRef}
                placeholder={options.length > 0 ? "Search options..." : "Type to add new values"} 
                value={searchValue}
                onValueChange={(value) => {
                  if (type === "number") {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setSearchValue(value);
                      onSearch?.(value);
                      return;
                    }
                  } else {
                    setSearchValue(value);
                    onSearch?.(value)
                  }
                }}
                onKeyDown={(e) => {
                  const value = (e.target as unknown as { value: string }).value;
                  if (e.key === "Enter") {
                    addTag(value.trim())
                  }
                }}
                onFocus={onFocus}
                className="border-0"
                inputMode={type === "number" ? "numeric" : undefined}
              />
              <CommandList className="max-h-60">
                {loading && <CommandEmpty>Loading...</CommandEmpty>}
                {(filteredOptions.length > 0 || showCreateOption) ? (
                  <>
                    <CommandEmpty>
                      {showCreateOption && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto px-2 py-2 mx-2"
                          onClick={() => addTag(searchValue.trim())}
                        >
                          Create &quot;{searchValue.trim()}&quot;
                        </Button>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredOptions.map((option) => {
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => addTag(option.value)}
                            className="cursor-pointer"
                          >
                            <CheckIcon className={cn(
                              "mr-2 h-4 w-4",
                              value.includes(option.value) ? "opacity-100" : "opacity-0"
                            )} />
                            {option.content || option.label}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
      </Popover>
    );
  }
);

InputTags.displayName = "InputTags";

export { InputTags };

// <InputTags
//  value={[]}
//  onChange={(value) => console.log(value)}
//  placeholder="Select tags to add..."
//  onSearch={() => {}}
//  disabled={disabled}
// />