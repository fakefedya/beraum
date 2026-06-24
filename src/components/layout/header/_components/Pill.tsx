import { Button } from "@/src/components/ui/button";
import { Search } from "lucide-react";

export const Pill = () => {
  return (
    <div className="bg-frost-glass h-full w-full rounded-full">
      <div className="flex h-full justify-between py-1 pr-1 pl-8">
        <nav className="flex w-full justify-between">
          <ul className="flex items-center gap-4">
            <li>Каталог</li>
            <li>Коллекции</li>
            <li>Дизайн интерьера</li>
          </ul>
          <ul className="flex items-center gap-4">
            <li>О бренде</li>
            <li>Поддержка</li>
            <li>
              <Search />
            </li>
            <li className="h-full">
              <Button className="bg-brand dark h-full rounded-full">
                Купить
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
