import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Search } from "lucide-react";

export function FilterToolbar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    sortBy: "time",
    newMinutes: 60,
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.keyword}
                onChange={(e) => handleChange("keyword", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">Danh mục</label>
            <Select
              value={filters.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <SelectOption value="">Tất cả danh mục</SelectOption>
              <SelectOption value="1">Danh mục 1</SelectOption>
              <SelectOption value="1.1" className="pl-6">
                → Danh mục 1.1
              </SelectOption>
              <SelectOption value="1.2" className="pl-6">
                → Danh mục 1.2
              </SelectOption>
              <SelectOption value="2">Danh mục 2</SelectOption>
              <SelectOption value="2.1" className="pl-6">
                → Danh mục 2.1
              </SelectOption>
              <SelectOption value="3">Danh mục 3</SelectOption>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">Sắp xếp</label>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleChange("sortBy", e.target.value)}
            >
              <SelectOption value="time">Thời gian kết thúc giảm dần</SelectOption>
              <SelectOption value="price">Giá tăng dần</SelectOption>
              <SelectOption value="bid">Nhiều lượt đấu giá nhất</SelectOption>
            </Select>
          </div>

          {/* New Minutes Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">
              Sản phẩm mới trong (phút):
            </label>
            <Input
              type="number"
              min="1"
              value={filters.newMinutes}
              onChange={(e) =>
                handleChange("newMinutes", parseInt(e.target.value) || 60)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
