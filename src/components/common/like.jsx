import React from "react";
import PropTypes from "prop-types";

const Like = ({ liked, onLikeClick }) => {
  let classes = "fa fa-heart";
  if (!liked) classes += "-o";
  return (
    <i
      onClick={onLikeClick}
      style={{ cursor: "pointer" }}
      className={classes}
      aria-hidden="true"
    />
  );
};

Like.propTypes = {
  liked: PropTypes.bool,
  onLikeClick: PropTypes.func.isRequired
};

export default Like;
