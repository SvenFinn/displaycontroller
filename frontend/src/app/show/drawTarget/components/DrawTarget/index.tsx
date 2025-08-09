import dynamic from 'next/dynamic';

const DrawTarget = dynamic(() => import('./drawTarget'), {
    ssr: false,
});

export default DrawTarget;