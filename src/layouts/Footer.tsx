import React, { Fragment } from "react";

export default React.memo(function Footer() {
  return (
    <Fragment>
      <footer className="fixed text-sm dark:text-white w-full text-end bottom-0 right-0 px-4 py-2">
        Powered by{" "}
        <a href="https://mkkcreation.com" target="_blank" className="text-indigo-500">
          @MKK Creation
        </a>
      </footer>
    </Fragment>
  );
});
