export default function ProductFilters({ action, hidden = {}, values = {} }) {
  return (
    <form action={action} method="GET" className="flex flex-wrap items-end gap-3 border-b border-gray-200 pb-4">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <label className="flex flex-col text-xs text-gray-500">
        Min price
        <input
          type="number"
          name="minPrice"
          min="0"
          step="0.01"
          defaultValue={values.minPrice ?? ""}
          className="mt-1 w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500"
        />
      </label>

      <label className="flex flex-col text-xs text-gray-500">
        Max price
        <input
          type="number"
          name="maxPrice"
          min="0"
          step="0.01"
          defaultValue={values.maxPrice ?? ""}
          className="mt-1 w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500"
        />
      </label>

      <label className="flex flex-col text-xs text-gray-500">
        Sort by
        <select
          name="sort"
          defaultValue={values.sort ?? "newest"}
          className="mt-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white"
      >
        Apply
      </button>
    </form>
  );
}
