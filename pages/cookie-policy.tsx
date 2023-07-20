import { T } from "@magic-translate/react";
import { GetStaticPropsResult } from "next";

interface Props {
  title: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "Cookie policy",
    },
  };
}

const CookiePolicy = () => (
  <div>
    <style
      dangerouslySetInnerHTML={{
        __html:
          "\n    a.cky-banner-element {\n        padding: 8px 30px;\n        background: #F8F9FA;\n        color: #858A8F;\n        border: 1px solid #DEE2E6;\n        box-sizing: border-box;\n        border-radius: 2px;\n        cursor: pointer;\n}\n",
      }}
    />
    <h1 className="cookie-policy-h1">
      <T>Cookie Policy</T>
    </h1>
    <p>
      <T>
        Effective Date: 19-Oct-2022 <br />
        Last Updated: 19-Oct-2022
      </T>
    </p>
    &nbsp;
    <h5>
      <T>What are cookies?</T>
    </h5>
    <div className="cookie-policy-p">
      <p>
        <T>
          This Cookie Policy explains what cookies are and how we use them, the
          types of cookies we use i.e, the information we collect using cookies
          and how that information is used, and how to manage the cookie
          settings.
        </T>
      </p>{" "}
      <p>
        <T>
          Cookies are small text files that are used to store small pieces of
          information. They are stored on your device when the website is loaded
          on your browser. These cookies help us make the website function
          properly, make it more secure, provide better user experience, and
          understand how the website performs and to analyze what works and
          where it needs improvement.
        </T>
      </p>
    </div>
    &nbsp;
    <h5>
      <T>How do we use cookies?</T>
    </h5>
    <div className="cookie-policy-p">
      <p>
        <T>
          As most of the online services, our website uses first-party and
          third-party cookies for several purposes. First-party cookies are
          mostly necessary for the website to function the right way, and they
          do not collect any of your personally identifiable data.
        </T>
      </p>{" "}
      <p>
        <T>
          The third-party cookies used on our website are mainly for
          understanding how the website performs, how you interact with our
          website, keeping our services secure, providing advertisements that
          are relevant to you, and all in all providing you with a better and
          improved user experience and help speed up your future interactions
          with our website.
        </T>
      </p>
    </div>
    &nbsp;
    <h5>
      <T>Types of Cookies we use</T>
    </h5>
    <div className="cky-audit-table-element" />
    &nbsp;
    <h5 style={{ marginBottom: "20px" }}>
      <T>Manage cookie preferences</T>
    </h5>
    <a className="cky-banner-element">
      <T>Cookie Settings</T>
    </a>{" "}
    <br />
    <div>
      <p>
        <T>
          You can change your cookie preferences any time by clicking the above
          button. This will let you revisit the cookie consent banner and change
          your preferences or withdraw your consent right away.
        </T>
      </p>{" "}
      <p>
        <T>
          In addition to this, different browsers provide different methods to
          block and delete cookies used by websites. You can change the settings
          of your browser to block/delete the cookies. Listed below are the
          links to the support documents on how to manage and delete cookies
          from the major web browsers.
        </T>
      </p>{" "}
      <p>
        Chrome:{" "}
        <a
          rel="noopener noreferrer"
          href="https://support.google.com/accounts/answer/32050"
          target="_blank"
        >
          https://support.google.com/accounts/answer/32050
        </a>
      </p>
      <p>
        Safari:{" "}
        <a
          rel="noopener noreferrer"
          href="https://support.apple.com/en-in/guide/safari/sfri11471/mac"
          target="_blank"
        >
          https://support.apple.com/en-in/guide/safari/sfri11471/mac
        </a>
      </p>
      <p>
        Firefox:{" "}
        <a
          rel="noopener noreferrer"
          href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox?redirectslug=delete-cookies-remove-info-websites-stored&redirectlocale=en-US"
          target="_blank"
        >
          https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox?redirectslug=delete-cookies-remove-info-websites-stored&amp;redirectlocale=en-US
        </a>
      </p>
      <p>
        Internet Explorer:{" "}
        <a
          rel="noopener noreferrer"
          href="https://support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer-bca9446f-d873-78de-77ba-d42645fa52fc"
          target="_blank"
        >
          https://support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer-bca9446f-d873-78de-77ba-d42645fa52fc
        </a>
      </p>
      <p>
        <T>
          If you are using any other web browser, please visit your browser’s
          official support documents.
        </T>
      </p>
    </div>
    &nbsp;
    <p className="cookie-policy-p">
      <T>Cookie Policy Generated By</T>{" "}
      <a
        rel="noopener noreferrer"
        target="_blank"
        href="https://www.cookieyes.com/?utm_source=CP&utm_medium=footer&utm_campaign=UW"
      >
        CookieYes - Cookie Policy Generator
      </a>
      .
    </p>
  </div>
);

export default CookiePolicy;
