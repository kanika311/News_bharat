import React from "react";

export default function ErrorPage({ statusCode }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        {statusCode ? `Error ${statusCode}` : "An error occurred"}
      </h1>
      <p style={{ color: "#666", marginTop: "10px" }}>
        कृपया पेज को रिफ्रेश करें (Please refresh the page).
      </p>
      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#dc2626",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        मुख्य पृष्ठ (Home)
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

