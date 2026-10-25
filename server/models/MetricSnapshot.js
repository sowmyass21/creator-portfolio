import mongoose from 'mongoose';

const metricSnapshotSchema = new mongoose.Schema({
  platform: { type: String, required: true, index: true },
  metricName: { type: String, required: true, index: true },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

const MetricSnapshot = mongoose.models.MetricSnapshot || mongoose.model('MetricSnapshot', metricSnapshotSchema);
export default MetricSnapshot;
