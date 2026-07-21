import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu";
import { NavExternal, NavItem } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface NavExternalSectionProps {
  links: readonly NavItem[];
}

export const NavExternalSection = ({ links }: NavExternalSectionProps) => {
  if (!links || links.length === 0) return null;

  const externalLinks = links.filter((link) => link.type === "external");

  return (
    <NavigationMenuList>
      {externalLinks.map((link, idx) => {
        const key = `nav-item-${idx}`;
        return <ExternalLinkNode key={key} item={link} />;
      })}
    </NavigationMenuList>
  );
};

const ExternalLinkNode = ({ item }: { item: NavExternal }) => {
  const target = item.target || "_self";
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;

  return (
    <NavigationMenuItem className="hidden h-full items-center lg:flex">
      <NavigationMenuLink asChild>
        <a
          href={item.href}
          target={target}
          rel={rel}
          className={cn(
            navigationMenuTriggerStyle(),
            "text-foreground h-12 rounded-[14px] px-4 font-medium tracking-tight",
            "hover:bg-card gap-2 [&_svg]:size-4.5",
          )}
        >
          {item.label}
          <ExternalLink />
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};
