import stripAnsi from 'strip-ansi';

interface SessionState {
  lines: string[];
}

const sessionStates: Map<string, SessionState> = new Map();

export function middleware(store: any) {
  return (next: (action: any) => any) => (action: any) => {
    if (action.type === 'SESSION_PTY_DATA') {
      const { data, uid } = action;

      sessionStates.set(uid, sessionStates.get(uid) ?? { lines: [''] });
      const ss = sessionStates.get(uid);

      const prevLastLine = ss.lines.pop();
      const prevLastLineAndNewData = prevLastLine + data;

      const newLines = prevLastLineAndNewData.split('\n');

      const allLines = [...ss.lines, ...newLines];

      // Taking last 5 lines from ss.lines
      const last5Lines = allLines.slice(-5);
      ss.lines = last5Lines;

      const lastLine = last5Lines[last5Lines.length - 1];

      // console.log(last5Lines);
      // console.log(last5Lines.map(line => stripAnsi(line)));

      if (lastLine.match(/colorred/)) {
        console.log('LAST LINE IS RED');

        store.dispatch({
          type: 'SESSION_COLOR_CHANGED',
          sessionId: uid,
          color: 'red'
        });
      }

      if (lastLine.match(/colorgreen/)) {
        console.log('LAST LINE IS GREEN');

        store.dispatch({
          type: 'SESSION_COLOR_CHANGED',
          sessionId: uid,
          color: 'green'
        });
      }

      if (lastLine.match(/colorblue/)) {
        console.log('LAST LINE IS BLUE');

        store.dispatch({
          type: 'SESSION_COLOR_CHANGED',
          sessionId: uid,
          color: 'blue'
        });
      }

      if (lastLine.match(/colororange/)) {
        console.log('LAST LINE IS ORANGE');

        store.dispatch({
          type: 'SESSION_COLOR_CHANGED',
          sessionId: uid,
          color: 'orange'
        });
      }

      if (lastLine.match(/colorblack/)) {
        console.log('LAST LINE IS BLACK');

        store.dispatch({
          type: 'SESSION_COLOR_CHANGED',
          sessionId: uid,
          color: 'black'
        });
      }
    }

    return next(action);
  };
}

export const reduceTermGroups = (state: any, action: any) => {
  if (action.type === 'SESSION_COLOR_CHANGED') {
    const termGroupId = Object.keys(state.termGroups).find(
      key => state.termGroups[key].sessionUid === action.sessionId
    );

    if (!termGroupId) return state;

    return state.setIn(['termGroups', termGroupId, 'color'], action.color);

    // return {
    //   ...state,
    //   termGroups: {
    //     ...state.termGroups,
    //     [termGroupId]: {
    //       ...state.termGroups[termGroupId],
    //       color: action.color
    //     }
    //   }
    // };
  }

  return state;
};

export const mapHeaderState = (state: any, map: any) => {
  return Object.assign({}, map, {
    cols: state.ui.cols,
    tabs: map.tabs.map(t => ({ ...t, rootTermGroup: state.termGroups.termGroups[t.uid] }))
  });
};

export const getTabProps = (tab: any, _parentProps: any, props: any) => {
  return { ...props, tabId: tab.uid, rootTermGroup: tab.rootTermGroup };
};

const TabBg = ({ React, termGroup }: { React: any, termGroup: any }) => {
  if (!termGroup) {
    return null;
  }

  const color = termGroup.color;

  return (
    <div style={{ position: 'absolute', left: -24, right: -24, top: 0, bottom: 0, opacity: 0.2, backgroundColor: color }}>
    </div>
  );
}

export const decorateTab = (Tab: any, { React }: { React: any }) => {
  return class extends Tab {
    render() {
      this.props.text = (
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <TabBg React={React} termGroup={this.props.rootTermGroup} />
          <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>{this.props.text}</div>
        </div>
      );
      return super.render();
    }
  };
};

export const getTermProps = (termId: any, parentProps: any, term: any) => {
  const color = parentProps.termGroup.color;

  return { ...term, color, backgroundColor: 'transparent' };
};

export const decorateTerm = (Term: any, { React }: { React: any }) => {
  return class extends Term {
    render() {
      return <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: this.props.color, opacity: 0.2 }}>
        </div>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {super.render()}
        </div>
      </div>
    }
  };
};

export const decorateHyper = (Hyper: any, { React }: { React: any }) => {
  return class extends React.Component {
    render() {
      return (
        <div>
          <style>{`
            .tab_textInner {
              overflow: visible !important;
            }
          `}</style>
          <Hyper {...this.props} />
        </div>
      );
    }
  };
};

// export const decorateConfig = (config: any) => {
//   console.log(111);
//   console.log(111);
//   console.log(111);
//   return {
//     ...config,
//     css: `
//       ${config.css ?? ''}

//       .tab_textInner {
//         overflow: visible !important;
//       }
//     `
//   };
// };
