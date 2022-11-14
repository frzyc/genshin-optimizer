import { CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { useEffect } from 'react';
import './App.scss';
import CardLight from './Components/Card/CardLight';
import ModalWrapper from './Components/ModalWrapper';
import './Database/Database';
import { evtExcerpt, evtFoundTitle } from './event';
import './i18n';
import './index.css';
import useBoolState from './ReactHooks/useBoolState';
import emoji from "./Rosaria4Yeet.png"

const klist = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a', 'enter']

export default function KC() {
  const [show, onShow, onHide] = useBoolState(false)
  useEffect(() => {
    let index = 0

    document.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if (key === klist[index]) {
        index++
      } else {
        index = 0
      }
      if (index === 11) {
        onShow()
        index = 0
      }
    });
  }, [onShow])
  return <ModalWrapper containerProps={{ maxWidth: "md" }} open={show} onClose={onHide}>
    <CardLight>
      <CardHeader title={evtFoundTitle} />
      <Divider />
      <CardContent>
        {evtExcerpt}
        <Typography><strong><code>:Rosaria4Yeet:</code></strong></Typography>
        <img src={emoji} alt="" />
        <Typography variant='h6'><code>K0NAMIC0D3</code></Typography>
      </CardContent>
    </CardLight>
  </ModalWrapper>
}
