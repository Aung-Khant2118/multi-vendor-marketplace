import Link from 'next/link';
import { getCategoryStyle } from '../../lib/catalog';

export default function CategoryChip({ category }) {
  const { icon: Icon, className } = getCategoryStyle(category.name);

  return (
    <Link href={`/products?category=${category.id}`} className={`category-chip ${className}`}>
      <span className="category-chip-icon">
        <Icon />
      </span>
      <span>{category.name}</span>
    </Link>
  );
}
