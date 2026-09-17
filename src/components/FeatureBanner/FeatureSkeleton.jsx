// @ts-nocheck
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function FeatureSkeleton() {
  return (
    <div className="feature-skeleton" aria-hidden="true">
      <SkeletonTheme baseColor="#e6e8ec" highlightColor="#f7f8fa">
        <div className="feature-skeleton__stage">
          <div className="feature-skeleton__copy">
            <Skeleton width={110} height={28} borderRadius={50} />
            <Skeleton width="55%" height={48} style={{ marginTop: 16 }} />
            <Skeleton width="42%" height={18} style={{ marginTop: 12 }} count={2} />
            <Skeleton width={280} height={52} borderRadius={50} style={{ marginTop: 20 }} />
          </div>
        </div>
      </SkeletonTheme>
    </div>
  );
}
