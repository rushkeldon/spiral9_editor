import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Editor } from '@milkdown/core';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame-dark.css';

type CrepeInstanceProps = {
  onReady?: (crepe: Crepe, editor: Editor) => void;
  initialContent?: string;
};

export default function CrepeEditor({ onReady, initialContent = '' }: CrepeInstanceProps) {
  const refContainerDiv = useRef<HTMLDivElement>(null);
  const refCrepe = useRef<Crepe>(null);
  const refEditor = useRef<Editor>(null);

  useEffect(() => {
    const init = async () => {
      refCrepe.current = new Crepe({
        root: refContainerDiv.current!,
        defaultValue: initialContent,
        features : {
          [ Crepe.Feature.Placeholder ] : true,
          [ Crepe.Feature.Toolbar ] : true,
          [ Crepe.Feature.BlockEdit ] : true,
          [ Crepe.Feature.ListItem ] : true,
          [ Crepe.Feature.LinkTooltip ] : true,
          [ Crepe.Feature.ImageBlock ] : false, // Temporarily disable block image to allow inline image insertion via upload plugin
          [ Crepe.Feature.Table ] : true,
          [ Crepe.Feature.Cursor ] : true,
          [ Crepe.Feature.CodeMirror ] : true,
          [ Crepe.Feature.Latex ] : true
        },
        featureConfigs : {
          [ Crepe.Feature.Placeholder ] : {
            text : 'insert here...'
          }
        }
      });

      refEditor.current = await refCrepe.current.create();

      onReady?.(refCrepe.current, refEditor.current );
    };

    init()
    .catch((err) => {
      console.error('Failed to initialize Crepe editor:', err);
    });
  }, [onReady]);

  return <div ref={refContainerDiv} />;
}
