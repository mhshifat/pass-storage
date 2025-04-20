"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { GlobeSolid } from "@/components/icons/globe-solid";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Translate from './translate';

interface LanguageSwitcherProps {
  size?: "sm";
}

export function LanguageSwitcher({ size }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size || "icon"} className="w-9 px-0">
          <GlobeSolid className="h-4 w-4" />
          <span className="sr-only"><Translate>Switch language</Translate></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <Translate>English</Translate>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('bn')}>
          <Translate>Bengali</Translate>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
