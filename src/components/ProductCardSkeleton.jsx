import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './ProductCard.css';

export function ProductCardSkeleton() {
    return (
        <div className='product-card'>
            <Skeleton height={250} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
            <div className='product-card__body'>
                <Skeleton width={80} height={24} style={{ borderRadius: 999 }} />
                <Skeleton height={28} width="80%" style={{ marginTop: '4px' }} />
                <Skeleton count={2} height={16} width="100%" style={{ marginTop: '8px' }} />
                <Skeleton height={34} width="40%" style={{ marginTop: '12px' }} />
                <div className='product-card__meta' style={{ marginTop: '16px' }}>
                    <Skeleton width={60} height={18} />
                    <Skeleton width={80} height={18} />
                </div>
            </div>
        </div>
    );
}
