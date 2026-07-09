#import <AVFoundation/AVFoundation.h>
#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>

static void usage(void) {
  fprintf(stderr, "Usage: extract_video_frames <video> <output_dir> [fps]\n");
  fprintf(stderr, "Example: extract_video_frames recording.mp4 outputs/frames 1\n");
}

int main(int argc, const char * argv[]) {
  @autoreleasepool {
    if (argc < 3) {
      usage();
      return 2;
    }

    NSString *videoPath = [NSString stringWithUTF8String:argv[1]];
    NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
    double fps = argc >= 4 ? atof(argv[3]) : 1.0;
    if (fps <= 0) {
      fps = 1.0;
    }

    NSURL *videoURL = [NSURL fileURLWithPath:videoPath];
    NSURL *outputURL = [NSURL fileURLWithPath:outputPath isDirectory:YES];
    NSError *error = nil;
    [[NSFileManager defaultManager] createDirectoryAtURL:outputURL
                             withIntermediateDirectories:YES
                                              attributes:nil
                                                   error:&error];
    if (error != nil) {
      fprintf(stderr, "Could not create output dir: %s\n", [[error localizedDescription] UTF8String]);
      return 1;
    }

    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:videoURL options:nil];
    double duration = CMTimeGetSeconds(asset.duration);
    if (!isfinite(duration) || duration <= 0) {
      fprintf(stderr, "Could not read video duration.\n");
      return 1;
    }

    AVAssetImageGenerator *generator = [[AVAssetImageGenerator alloc] initWithAsset:asset];
    generator.appliesPreferredTrackTransform = YES;
    generator.requestedTimeToleranceBefore = CMTimeMakeWithSeconds(0.5, 600);
    generator.requestedTimeToleranceAfter = CMTimeMakeWithSeconds(0.5, 600);
    generator.maximumSize = CGSizeMake(1600, 1600);

    double step = 1.0 / fps;
    int frameIndex = 0;
    printf("duration=%.3f\n", duration);

    for (double second = 0; second <= duration; second += step) {
      CMTime time = CMTimeMakeWithSeconds(second, 600);
      CGImageRef image = [generator copyCGImageAtTime:time actualTime:nil error:&error];
      if (image == nil) {
        fprintf(stderr, "Frame %.3f failed: %s\n", second, error ? [[error localizedDescription] UTF8String] : "unknown error");
        continue;
      }

      NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc] initWithCGImage:image];
      NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
      CGImageRelease(image);
      if (png == nil) {
        fprintf(stderr, "Frame %.3f failed: PNG encode error\n", second);
        continue;
      }

      NSString *timeLabel = [[NSString stringWithFormat:@"%06.2f", second] stringByReplacingOccurrencesOfString:@"." withString:@"_"];
      NSString *fileName = [NSString stringWithFormat:@"frame_%04d_%@.png", frameIndex, timeLabel];
      NSURL *targetURL = [outputURL URLByAppendingPathComponent:fileName];
      if (![png writeToURL:targetURL atomically:YES]) {
        fprintf(stderr, "Frame %.3f failed: write error\n", second);
        continue;
      }

      printf("%s\n", [[targetURL path] UTF8String]);
      frameIndex += 1;
    }

    printf("frames=%d\n", frameIndex);
    return 0;
  }
}
