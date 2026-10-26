"use client";
import * as S from "@radix-ui/react-switch";

export function Switch({
  name,
  defaultChecked,
  checked,
  onCheckedChange,
  label,
}: {
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (c: boolean) => void;
  label: string;
}) {
  return (
    <S.Root
      name={name}
      value="on"
      defaultChecked={defaultChecked}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="relative h-6 w-[42px] shrink-0 cursor-pointer rounded-full bg-line2 transition-colors data-[state=checked]:bg-green-600"
    >
      <S.Thumb className="block h-[18px] w-[18px] translate-x-[3px] rounded-full bg-white transition-transform data-[state=checked]:translate-x-[21px]" />
    </S.Root>
  );
}
