export default function ProductFilters({ action, hidden = {}, values = {} }) {
  return (
    <form action={action} method="GET" className="flex flex-wrap items-end gap-3 border-b border-sand pb-4">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <label className="flex flex-col text-xs text-stone">
        Min price
        <input
          type="number"
          name="minPrice"
          min="0"
          step="0.01"
          defaultValue={values.minPrice ?? ""}
          className="mt-1 w-24 rounded-md border border-sand bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-clay"
        />
      </label>

      <label className="flex flex-col text-xs text-stone">
        Max price
        <input
          type="number"
          name="maxPrice"
          min="0"
          step="0.01"
          defaultValue={values.maxPrice ?? ""}
          className="mt-1 w-24 rounded-md border border-sand bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-clay"
        />
      </label>

      <label className="flex flex-col text-xs text-stone">
        Sort by
        <select
          name="sort"
          defaultValue={values.sort ?? "newest"}
          className="mt-1 rounded-md border border-sand bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-clay"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-canvas transition hover:bg-clay"
      >
        Apply
      </button>
    </form>
  );
}
