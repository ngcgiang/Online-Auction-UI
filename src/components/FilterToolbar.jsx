import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { getCategories, organizeCategoriesHierarchy } from "@/services/categoryService";

export function FilterToolbar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    sortBy: "time",
    newMinutes: '',
  });

  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        if (response && response.success) {
          const hierarchicalCategories = organizeCategoriesHierarchy(response.data);
          setCategories(hierarchicalCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleChange("category", category.category_name);
    setIsDropdownOpen(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    handleChange("category", "");
    setIsDropdownOpen(false);
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

          {/* Category Dropdown */}
          <div className="flex-1 min-w-[200px]" ref={dropdownRef}>
            <label className="text-sm font-medium mb-1.5 block">Danh mục</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <span className={selectedCategory ? "" : "text-muted-foreground"}>
                  {selectedCategory ? selectedCategory.category_name : "Tất cả danh mục"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                  <div className="p-1">
                    <button
                      onClick={handleClearCategory}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                    >
                      Tất cả danh mục
                    </button>
                    {categories.map((parentCategory) => (
                      <CategoryItem
                        key={parentCategory.category_id}
                        category={parentCategory}
                        onSelect={handleCategorySelect}
                        selectedId={selectedCategory?.category_id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1.5 block">Sắp xếp</label>
            <Select value={filters.sortBy} onValueChange={(value) => handleChange("sortBy", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cách sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Thời gian kết thúc giảm dần</SelectItem>
                <SelectItem value="price">Giá tăng dần</SelectItem>
                <SelectItem value="bid">Nhiều lượt đấu giá nhất</SelectItem>
              </SelectContent>
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
                handleChange("newMinutes", e.target.value === "" ? "" : parseInt(e.target.value) || 60)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryItem({ category, onSelect, selectedId, level = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelect(category)}
        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm flex items-center justify-between ${
          selectedId === category.category_id ? "bg-accent" : ""
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <span>{category.category_name}</span>
        {hasChildren && <ChevronRight className="h-4 w-4 opacity-50" />}
      </button>

      {hasChildren && isHovered && (
        <div className="absolute left-full top-0 ml-1 w-full rounded-md border bg-popover shadow-lg z-50">
          <div className="p-1">
            {category.children.map((child) => (
              <CategoryItem
                key={child.category_id}
                category={child}
                onSelect={onSelect}
                selectedId={selectedId}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
