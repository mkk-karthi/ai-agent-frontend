import React, { Fragment } from "react";

export default React.memo(function Footer() {
  return (
    <Fragment>
      <div className="fixed text-base dark:text-white w-full text-end bottom-0 right-0 px-4 py-2">
        Developed by{" "}
        <a href="https://mkkcreation.com" target="_blank" className="text-indigo-500 mr-2">
          @MKK Creation
        </a>
      </div>
    </Fragment>
  );
});
