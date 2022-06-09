import { Command, setup, request, finalize, breakdown } from "./background"
import { assertUnreachable } from '../../../../Util/Util';

onmessage = ({ data }: { data: Command }) => {
  const command = data.command
  switch (command) {
    case "setup": postMessage(setup(data, interim => postMessage(interim, undefined))); break
    case "breakdown": postMessage(breakdown(data)); break
    case "request": postMessage(request(data)); break
    case "finalize": postMessage(finalize()); break
    default: assertUnreachable(command)
  }
}
