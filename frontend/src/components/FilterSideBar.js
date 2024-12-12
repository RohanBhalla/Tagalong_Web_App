import Select from "react-select";

const options = [
  { value: "all", label: "All" },
  { value: "category1", label: "Category 1" },
  { value: "category2", label: "Category 2" },
];

const options2 = [
  { value: "Relevant", label: "Relevant" },
  { value: "Popular", label: "Popular" },
  { value: "Newest", label: "Newest" },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "white",
    borderColor: "#444",
    color: "black",
    width: 200,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "lightblue"
      : state.isFocused
      ? "lightblue"
      : "white",
    color: "black",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white",
  }),
};

export default function FilterSideBar() {
  return (
    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark fixed-sidebar">
      <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
        <div className="mt-3 w-100">
          <h6 className="mb-3">Filter & Sort</h6>
          <form>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <Select
                className=""
                options={options}
                isMulti
                placeholder="Select Categories..."
                styles={customStyles}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Maximum Miles From Event</label>
              <input type="range" className="form-range" />
            </div>
          </form>
        </div>
        <div className="mt-3 w-100">
          <h6 className="mb-3">Sort By</h6>
          <form>
            <div className="mb-3">
              <Select className options={options2} styles={customStyles} />
            </div>
          </form>
        </div>
        <hr />
      </div>
    </div>
  );
}
