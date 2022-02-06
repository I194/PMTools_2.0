import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface IExternalLink {
  to: string;
}

const ExternalLink: FC<IExternalLink> = ({ to }) => {
  window.location.href = to;
  return null;
}

export default ExternalLink;